<script lang="ts">
  import type { GifEntry } from "$lib/types.svelte";
  import GifTimelineFrame from "./GifTimelineFrame.svelte";
  import Button from "./Button.svelte";
  import {
    ChevronsLeftRightEllipsisIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    DownloadIcon,
    VideoIcon,
    RotateCcwIcon,
  } from "@lucide/svelte";
  import Tooltip from "./Tooltip.svelte";
  import exportFrames from "$lib/utils/exportFrames";
  import LoadingDialog from "./LoadingDialog.svelte";
  import convertToMp4 from "$lib/utils/convert/convertToMp4";
  import { reportError } from "$lib/stores/notifications.svelte";
  import downloadFile from "$lib/utils/downloadFile";
  import Dialog from "./Dialog.svelte";
  import Input from "./Input.svelte";
  import MenuItem from "./MenuItem.svelte";
  import Menu from "./Menu.svelte";
  import convertToGif from "$lib/utils/convert/convertToGif";

  type Props = {
    gif: GifEntry;
    currentIndex: number;
    playing: boolean;
  };

  let {
    gif = $bindable(),
    currentIndex = $bindable(),
    playing = $bindable(),
  }: Props = $props();
  let selectFrames = $state(false);
  let showFrames = $state(true);
  const frames = $derived(selectFrames ? gif.frames : gif.trimmedFrames);

  let exportDialog = $state<HTMLDialogElement | null>(null);
  let exportProgress = $state<null | number>(null);
  let exportAbortController: AbortController | null = null;
  let exportLoops = $state(1);

  function createAbortController() {
    exportAbortController?.abort();
    exportAbortController = new AbortController();
    exportAbortController.signal.addEventListener("abort", () => {
      abortExport();
    });
    return exportAbortController;
  }

  function openExportDialog() {
    exportDialog?.showModal();
    playing = false;
  }

  function abortExport() {
    exportAbortController?.abort();
    exportAbortController = null;
    exportProgress = null;
  }

  async function createMp4() {
    try {
      const exportAbortController = createAbortController();
      const file = await convertToMp4({
        gif,
        loops: exportLoops,
        onProgress(progress) {
          exportProgress = progress;
        },
        signal: exportAbortController.signal,
      });
      downloadFile(file);
    } catch (err) {
      reportError(err);
    } finally {
      abortExport();
    }
  }

  async function createGif() {
    try {
      abortExport();
      const ac = createAbortController();
      downloadFile(
        await convertToGif({
          gif,
          signal: ac.signal,
          onProgress(progress) {
            exportProgress = progress;
          },
        }),
      );
    } finally {
      exportProgress = null;
    }
  }
</script>

<Dialog
  bind:dialog={exportDialog}
  onSubmit={createMp4}
  submitLabel="Create MP4"
>
  <h1>Create video</h1>
  <Input label="Loops" type="number" bind:value={exportLoops} />
</Dialog>

{#if exportProgress}
  <LoadingDialog
    message="Creating mp4"
    progress={exportProgress}
    onClose={abortExport}
  />
{/if}

<div class="wrapper" class:is-selecting={selectFrames}>
  <div class="options">
    {#if showFrames}
      {#if selectFrames && gif.isTrimmed}
        <Tooltip label="Clear frame selection">
          <Button
            icon={RotateCcwIcon}
            onclick={() => {
              const shouldReset = window.confirm(
                "You want to reset the frame selection?",
              );
              if (shouldReset) gif.resetTrim();
            }}
          />
        </Tooltip>
      {/if}
      <Tooltip label={selectFrames ? "Exit select frames" : "Select frames"}>
        <Button
          icon
          active={selectFrames}
          onclick={() => {
            selectFrames = !selectFrames;
          }}
        >
          <ChevronsLeftRightEllipsisIcon size={16} absoluteStrokeWidth />
        </Button>
      </Tooltip>

      <Menu>
        <MenuItem
          icon={DownloadIcon}
          label="Download frames"
          onClick={() => {
            exportFrames(gif);
          }}
        />
        <MenuItem
          icon={VideoIcon}
          label="Download as MP4"
          onClick={openExportDialog}
        />
        <MenuItem
          icon={VideoIcon}
          label="Download as GIF"
          onClick={createGif}
        />
      </Menu>

      <Tooltip label="Hide timeline">
        <Button
          icon
          onclick={() => {
            showFrames = false;
          }}
        >
          <ChevronDownIcon size={16} absoluteStrokeWidth />
        </Button>
      </Tooltip>
    {:else}
      <Tooltip label="Hide timeline">
        <Button
          icon
          onclick={() => {
            showFrames = true;
          }}
        >
          <ChevronUpIcon size={16} absoluteStrokeWidth />
        </Button>
      </Tooltip>
    {/if}
  </div>
  {#if showFrames}
    <div class="frames">
      <div class="frames-inner">
        {#each frames as frame}
          <div class="frame">
            <GifTimelineFrame
              bind:gif
              {frame}
              {playing}
              bind:currentIndex
              {selectFrames}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    width: 100dvw;
  }

  .options {
    position: absolute;
    bottom: 100%;
    right: 0;
    background: hsl(from var(--color-accent) h s l / 0.6);
    padding: var(--spacing);
    border-top-left-radius: var(--spacing);
    display: flex;
    gap: var(--spacing-sm);
  }

  .frames {
    width: 100dvw;
    overflow: auto;
    scrollbar-color: hsl(from var(--color-text) h s l / 0.5)
      var(--color-background);
    background-color: var(--color-background);
    border-top: 1px solid var(--color-accent);
    display: flex;
  }

  .frame {
    border: 1px solid var(--color-accent);
    border-radius: var(--spacing-sm);

    &:not(:first-child) {
      margin-left: var(--spacing-sm);
    }
  }

  .frames-inner {
    display: inline-flex;
    flex-shrink: 0;
    margin-inline: auto;
    padding: var(--spacing) 0;
  }
</style>

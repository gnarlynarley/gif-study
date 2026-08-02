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
    PlayIcon,
    PauseIcon,
    SkipBackIcon,
    SkipForwardIcon,
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
    onPrevious: () => void;
    onNext: () => void;
  };

  let {
    gif = $bindable(),
    currentIndex = $bindable(),
    playing = $bindable(),
    onPrevious,
    onNext,
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

  function togglePlaying() {
    playing = !playing;
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

{#if exportProgress !== null}
  <LoadingDialog
    message="Exporting"
    progress={exportProgress}
    onClose={abortExport}
  />
{/if}

<div class="wrapper" class:is-selecting={selectFrames}>
  <div class="controls">
    <Button smallIcon icon={SkipBackIcon} onclick={onPrevious} />
    <Button
      smallIcon
      icon={playing ? PauseIcon : PlayIcon}
      onclick={togglePlaying}
    />
    <Button smallIcon icon={SkipForwardIcon} onclick={onNext} />
  </div>
  <div class="options">
    {#if showFrames}
      {#if selectFrames && gif.isTrimmed}
        <Tooltip label="Clear frame selection">
          <Button
            icon={RotateCcwIcon}
            smallIcon
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
          icon={ChevronsLeftRightEllipsisIcon}
          smallIcon
          active={selectFrames}
          onclick={() => {
            selectFrames = !selectFrames;
          }}
        />
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
          icon={ChevronDownIcon}
          smallIcon
          onclick={() => {
            showFrames = false;
          }}
        />
      </Tooltip>
    {:else}
      <Tooltip label="Hide timeline">
        <Button
          icon={ChevronUpIcon}
          smallIcon
          onclick={() => {
            showFrames = true;
          }}
        />
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

  .controls,
  .options {
    position: absolute;
    bottom: 100%;
    /* z-index: 1; */
    background: hsl(from var(--color-accent) h s l / 0.8);
    padding: var(--spacing);
    display: flex;
    gap: var(--spacing-sm);
    backdrop-filter: blur(6px);
  }

  .controls {
    border-top-right-radius: var(--spacing);
    left: 0;
  }

  .options {
    border-top-left-radius: var(--spacing);
    right: 0;
  }

  .frames {
    width: 100dvw;
    overflow: auto;
    scrollbar-color: hsl(from var(--color-text) h s l / 0.5)
      var(--color-background);
    background-color: var(--color-background);
    border-top: 1px solid var(--color-accent);
    display: flex;
    padding-inline: var(--spacing-sm);
  }

  .frame {
    border: 1px solid var(--color-accent);
    border-radius: var(--spacing-sm);
    width: min-content;

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

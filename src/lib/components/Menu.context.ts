import { createContext } from "svelte";

const [getMenuId, setMenuId] = createContext<string>();

export { getMenuId, setMenuId };

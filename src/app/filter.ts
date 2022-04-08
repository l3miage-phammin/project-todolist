import { TodoItem } from "./todolist.service";

export type FctFilter = (item: TodoItem) => boolean;
export const filterALL:FctFilter = (item)=> true;
export const filterCompleted: FctFilter = (item) => item.isDone;
export const filterActive: FctFilter = (item) => !item.isDone;

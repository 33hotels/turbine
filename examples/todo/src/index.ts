import {just, Maybe, nothing, withEffects} from "@funkia/jabz";
import {runComponent} from "../../../src";
import {app} from "./TodoApp";

export const getItemIO = withEffects((key: string): Maybe<any> => {
  const value = JSON.parse(localStorage.getItem(key));
  return value === null ? nothing : just(value);
});

export const setItemIO = withEffects((key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
});

runComponent("body", app);

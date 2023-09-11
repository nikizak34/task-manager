import { AddItemForm } from "common/components";
import { useActions } from "common/hooks";
import { TaskType } from "features/todolists-list/tasks/api/tasks.api.types";
import { tasksThunks } from "features/todolists-list/tasks/model/tasks.reducer";
import { TodolistDomainType } from "features/todolists-list/todolists/model/todolists.reducer";
import { FilterTasksButtons } from "features/todolists-list/todolists/ui/Todolist/filter-tasks-buttons/filter-tasks-buttons";
import { Tasks } from "features/todolists-list/todolists/ui/Todolist/tasks/tasks";

import React, { FC, memo, useCallback, useEffect } from "react";
import { TodolistTitle } from "./todolist-title/todolist-title";

type Props = {
  todolist: TodolistDomainType;
  tasks: TaskType[];
};

export const Todolist: FC<Props> = memo(({ todolist, tasks }) => {
  const { fetchTasks, addTask } = useActions(tasksThunks);

  useEffect(() => {
    fetchTasks(todolist.id);
  }, []);

  const addTaskCallBack = useCallback(
    (title: string) => {
      return addTask({ title, todolistId: todolist.id }).unwrap();
    },
    [todolist.id],
  );

  return (
    <>
      <TodolistTitle todolist={todolist} />
      <AddItemForm addItem={addTaskCallBack} disabled={todolist.entityStatus === "loading"} />
      <Tasks todolist={todolist} tasks={tasks} />
      <div style={{ paddingTop: "10px" }}>
        <FilterTasksButtons todolist={todolist} />
      </div>
    </>
  );
});

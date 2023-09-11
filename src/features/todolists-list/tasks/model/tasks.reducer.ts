import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {appActions, RequestStatusType} from "app/app.reducer";
import {clearTasksAndTodolists} from "common/actions";
import {ResultCode} from "common/enums";
import {createAppAsyncThunk} from "common/utils";
import {tasksApi} from "features/todolists-list/tasks/api/tasks.api";
import {
    AddTaskArgType,
    RemoveTaskArgType,
    TaskType,
    UpdateTaskArgType,
    UpdateTaskModelType,
} from "features/todolists-list/tasks/api/tasks.api.types";

import {todolistsThunks} from "features/todolists-list/todolists/model/todolists.reducer";

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  "tasks/fetchTasks",
  async (todolistId, thunkAPI) => {
    const res = await tasksApi.getTasks(todolistId);
    const tasks = res.data.items;
    return { tasks, todolistId };
  },
);

const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>("tasks/addTask", async (arg, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  const res = await tasksApi.createTask(arg);
  if (res.data.resultCode === ResultCode.Success) {
    const task = res.data.data.item;
    return { task };
  } else {
    return rejectWithValue({ data: res.data, showGlobalError: false });
  }
});

const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>(
  "tasks/updateTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI;

    const state = getState();
    const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
    if (!task) {
      dispatch(appActions.setAppError({ error: "Task not found in the state" }));
      return rejectWithValue(null);
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.domainModel,
    };

    const res = await tasksApi.updateTask(arg.todolistId, arg.taskId, apiModel);
    if (res.data.resultCode === ResultCode.Success) {
      return arg;
    } else {
      return rejectWithValue({ data: res.data, showGlobalError: true });
    }
  },
);

const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>(
  "tasks/removeTask",
  async (arg, thunkAPI) => {

    const { rejectWithValue,dispatch } = thunkAPI;
      dispatch(tasksAction.changeTaskEntityStatus({id:arg.todolistId,taskId:arg.taskId,entityStatus:"loading"}));
    const res = await tasksApi.deleteTask(arg);
    if (res.data.resultCode === ResultCode.Success) {
      return arg;
    } else {
      return rejectWithValue({ data: res.data, showGlobalError: true });
    }
  },
);

const initialState: TasksStateType = {};

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
      changeTaskEntityStatus: (state, action: PayloadAction<{taskId:string, id: string; entityStatus: RequestStatusType }>) => {
          const tasks = state[action.payload.id];
          const todo = tasks.find((todo) => todo.id === action.payload.taskId);
          if (todo) {
              todo.entityStatus = action.payload.entityStatus;
          }
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId];
        tasks.unshift(action.payload.task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId];
        const index = tasks.findIndex((t) => t.id === action.payload.taskId);
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...action.payload.domainModel };
        }
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId];
        const index = tasks.findIndex((t) => t.id === action.payload.taskId);
        if (index !== -1) tasks.splice(index, 1);
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = [];
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id];
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = [];
        });
      })
      .addCase(clearTasksAndTodolists, () => {
        return {};
      });
  },
});

export const tasksReducer = slice.reducer;
export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask };
export const tasksAction=slice.actions

export type TasksStateType = Record<string, TaskType[]>;

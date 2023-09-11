import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {appActions} from "app/app.reducer";
import {clearTasksAndTodolists} from "common/actions";
import {ResultCode} from "common/enums";
import {createAppAsyncThunk, handleServerNetworkError} from "common/utils";
import {authAPI, LoginParamsType, securityApi} from "features/auth/api/auth.api";

const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>("auth/login", async (arg, thunkAPI) => {
    const {rejectWithValue,dispatch} = thunkAPI;
    const res = await authAPI.login(arg);
    const we = await securityApi.getCaptchaUrl();
    if (res.data.resultCode === ResultCode.Success) {
        dispatch(authAction.getCaptcha({captchaUrl:null}))
        return {isLoggedIn: true};
    }  else {
        if (res.data.resultCode === ResultCode.Captcha) {
           dispatch(authAction.getCaptcha({captchaUrl:we.data.url}))

        }
        const isShowAppError = !res.data.fieldsErrors.length;
        return rejectWithValue({data: res.data, showGlobalError: isShowAppError});
    }
});


const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, void>("auth/logout", async (_, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI;

    const res = await authAPI.logout();
    if (res.data.resultCode === ResultCode.Success) {
        dispatch(clearTasksAndTodolists());
        return {isLoggedIn: false};
    } else {
        return rejectWithValue({data: res.data, showGlobalError: true});
    }
});

const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>("app/initializeApp", async (_, thunkAPI) => {

    const {dispatch, rejectWithValue} = thunkAPI;
    try {
        const res = await authAPI.me();
        if (res.data.resultCode === ResultCode.Success) {
            return {isLoggedIn: true};
        } else {
            return rejectWithValue(null);
        }
    } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null);

    } finally {
        dispatch(appActions.setAppInitialized({isInitialized: true}));
    }
});

const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
        captchaUrl:null as null|string

    },
    reducers: {
        getCaptcha: (state, action: PayloadAction<{ captchaUrl: string|null }>) => {
            state.captchaUrl = action.payload.captchaUrl;        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })


    },
});

export const authSlice = slice.reducer;
export const authAction = slice.actions;
export const authThunks = {login, logout, initializeApp};

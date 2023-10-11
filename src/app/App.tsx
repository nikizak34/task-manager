import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {HashRouter, Route, Routes} from "react-router-dom";
import {AppBar, Button, CircularProgress, Container, LinearProgress, Toolbar, Typography,} from "@mui/material";
import {Login} from "features/auth/ui/login/login";
import "./App.css";
import {TodolistsList} from "features/todolists-list/todolists-list";
import {ErrorSnackbar} from "common/components";
import {useActions} from "common/hooks";
import {selectIsLoggedIn} from "features/auth/model/auth.selectors";
import {selectAppStatus, selectIsInitialized} from "app/app.selectors";
import {authThunks} from "features/auth/model/auth.slice";

function App() {
    const status = useSelector(selectAppStatus);
    const isInitialized = useSelector(selectIsInitialized);
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const {initializeApp, logout,} = useActions(authThunks);

    useEffect(() => {
        initializeApp();
    }, []);

    const logoutHandler = () => logout();

    if (!isInitialized) {
        return (
            <div style={{position: "fixed", top: "30%", textAlign: "center", width: "100%"}}>
                <CircularProgress/>
            </div>
        );
    }

    return (
        <HashRouter>
            <div className="App" style={{paddingBottom:'60px'}}>
                <ErrorSnackbar/>
                <AppBar position="static" >
                    <Toolbar >
                        <Typography variant="h6">TodoList</Typography>
                        {isLoggedIn && (
                            <Button color="inherit" style={{paddingLeft:'50px'}} onClick={logoutHandler}>
                                Log out
                            </Button>
                        )}
                    </Toolbar>
                    {status === "loading" && <LinearProgress/>}
                </AppBar>

                <Container fixed>
                    <Routes>
                        <Route path={"/"} element={<TodolistsList/>}/>
                        <Route path={"/login"} element={<Login/>}/>
                    </Routes>
                </Container>
            </div>
        </HashRouter>
    );
}

export default App;

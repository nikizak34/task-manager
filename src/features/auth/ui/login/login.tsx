import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, TextField } from "@mui/material";
import { useLogin } from "features/auth/lib/useLogin";
import { selectIsLoggedIn } from "features/auth/model/auth.selectors";
import s from "features/auth/ui/login/login.module.css";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {AppRootStateType} from "../../../../app/store";

export const Login = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const captchaUrl=useSelector((state:AppRootStateType) => state.auth.captchaUrl)

  const { formik } = useLogin();

  if (isLoggedIn) {
    return <Navigate to={"/"} />;
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={4}>
        <form onSubmit={formik.handleSubmit}>
          <FormControl>
            <FormLabel>
              <p>
                To log in get registered{" "}
                <a href={"https://social-network.samuraijs.com/"} target={"_blank"} rel="noreferrer">
                  here
                </a>
              </p>
              <p>or use common test account credentials:</p>
              <p> Email: nikita2000.16.11@gmail.com</p>
              <p>Password: terranozavr35_7</p>
            </FormLabel>
            <FormGroup>
              <TextField label="Email" margin="normal" {...formik.getFieldProps("email")} />
              {formik.touched.email && formik.errors.email && <p className={s.error}>{formik.errors.email}</p>}
              <TextField type="password" label="Password" margin="normal" {...formik.getFieldProps("password")} />
              {formik.touched.password && formik.errors.password && <p className={s.error}>{formik.errors.password}</p>}
              <FormControlLabel
                label={"Remember me"}
                control={<Checkbox {...formik.getFieldProps("rememberMe")} checked={formik.values.rememberMe} />}
              />
              {captchaUrl&&[<img src={captchaUrl}/>,
             <TextField type="symbol" label="captcha" margin="normal" {...formik.getFieldProps("captcha")} />]}

              <Button
                type={"submit"}
                variant={"contained"}
                disabled={!(formik.isValid && formik.dirty)}
                color={"primary"}
              >
                Login
              </Button>
            </FormGroup>
          </FormControl>
        </form>
      </Grid>
    </Grid>
  );
};

import React from "react";
import { Toolbar, Typography, Button, makeStyles } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const customStyles = makeStyles(theme => ({
    title: {
        flexGrow: 1,
    },
}));

const ClockAndConnection = (props) => {

    const {globalTime, error, notification, setNotification} = props;

    const classes = customStyles();
    const dateTimeFormat = new Intl.DateTimeFormat('en', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });

    const closeNotification = (open) => {
        if (open)
            notification.cb();
        setNotification({ open: false, message: "", buttonText: "", cb: null });
    };

    return <Toolbar>
        {error !== 1 && <Alert severity="error" variant="filled">Failed to Connect to the Server... Either Internet Connection is Poor, Or Server is Unavailable</Alert>}
        {notification.open && <Alert elevation={5} variant="outlined" severity="warning" action={<>{notification.buttonText!==''&&<Button onClick={() => closeNotification(true)}>{notification.buttonText}</Button>}<Button onClick={() => closeNotification(false)}>&#10006;</Button></>}>
          {notification.message}
        </Alert>}
        <Typography variant="h6" noWrap className={classes.title}>{""}</Typography>
        <Alert elevation={5} severity="info" variant="outlined">{dateTimeFormat.format(new Date(globalTime))}</Alert>
    </Toolbar>
};

export default ClockAndConnection;
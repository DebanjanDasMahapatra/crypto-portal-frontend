import React from "react";
import { makeStyles, Typography, Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        textAlign: 'center',
        padding: '5%',
        opacity: 0.9
    }
}));

const ErrorPage = (props) => {

    const classes = useStyles();

    return (
        <Paper className={classes.root}>
            <Typography variant="h2">
                The Page You Requested Does Not Exist !!!<br /><br />Please Go Back and Navigate using the Links and Buttons of the Website :)
            </Typography>
        </Paper>
    );
};

export default ErrorPage;


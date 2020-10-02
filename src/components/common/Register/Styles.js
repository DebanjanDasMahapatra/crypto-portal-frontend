import { makeStyles } from "@material-ui/core";

export const customStyles = makeStyles((theme) => ({
    root: {
        textAlign: 'center',
    },
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        opacity: 0.9
    },
}));
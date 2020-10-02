import React from "react";
import axios from "axios";
import clsx from "clsx";
import { configs } from "../../../globals";
import { customStyles } from "./Styles";
import MuiAlert from '@material-ui/lab/Alert';
import { Typography, TextField, Button, Grid, Paper } from "@material-ui/core";

const Register = (props) => {

    const { history, setLoading, setSnack, openConfirmation } = props;

    const classes = customStyles();
    const [user, setUser] = React.useState({});
    const [ecrs, setECRs] = React.useState([]);
    const [errors, setErrors] = React.useState({
        name: "",
        email: "",
        contact: "",
        rcid: "",
        password: ""
    });
    const [valid, setValid] = React.useState(false);

    const register = () => {
        setLoading(true);
        let userData = user;
        Object.keys(userData).forEach(k => userData[k] = k === 'password' ? userData[k] : userData[k].trim());
        axios.post(`${configs.baseUrl}/user/register`, userData).then(result => {
            setSnack({ show: true, msg: result.data.message, status: result.data.status });
            if(result.data.status) history.push('/');
            setLoading(false);
        }).catch(error => {
            setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
            setLoading(false);
        });
    };

    const fetchEmailsContacts = () => {
        setLoading(true);
        axios.get(`${configs.baseUrl}/user/fetchECRs`).then(result => {
            if (result.data.status)
                setECRs(result.data.users);
            setLoading(false);
        }).catch(error => {
            setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
            setLoading(false);
        });
    };

    const validate = (field, value) => {
        let valid = false, msg = "", redundant = false;
        switch (field) {
            case 'name':
                valid = /^[A-Za-z ]/.test(value.trim());
                msg = value ? (valid ? "" : "Name must contain only spaces and alphabets") : "Name is Required";
                break;
            case 'email':
                redundant = ecrs.find(ecr => ecr.email === value) !== undefined;
                valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
                msg = redundant ? "This Email ID is already registered" : (value ? (valid ? "" : "Email ID is invalid") : "Email ID is Required");
                break;
            case 'contact':
                redundant = ecrs.find(ecr => ecr.contact === value) !== undefined;
                valid = /^[6-9]{1}[0-9]{9}/.test(value);
                msg = redundant ? "This Contact is already registered" : (value ? (valid ? "" : "Contact Number must contain exactly 10 digits") : "Contact Number is Required");
                break;
            case 'rcid':
                redundant = ecrs.find(ecr => ecr.rcid + "" === value + "") !== undefined;
                valid = value !== "";
                msg = redundant ? "This RC ID is already registered" : (value ? "" : "RC ID is Required");
                break;
            case 'password':
                valid = value.trim() !== "";
                msg = valid ? "" : "Password is Required!!!";
                break;
        }
        if (valid && !redundant) {
            setUser({ ...user, [field]: value });
            setErrors({ ...errors, [field]: "C" });
        } else
            setErrors({ ...errors, [field]: msg });
    }

    React.useEffect(() => {
        setValid(isValidForm());
    }, [errors]);

    const isValidForm = () => {
        return errors.name === "C" && errors.email === "C" && errors.contact === "C" && errors.rcid === "C" && errors.password === "C";
    }

    const reg = () => {
        openConfirmation({ title: "Confirm", content: `Sure to Register?`, positiveButtonText: "Yes, Register", negativeButtonText: "No", cb: register })
    };

    React.useEffect(() => {
        fetchEmailsContacts();
        if (configs.isLoggedIn())
            history.push('/');
        else {
            document.title = "CryptoQuest|Registration";
        }
    }, []);

    return (
        <Grid container spacing={6}>
            <Grid item md={3} className="force100"></Grid>
            <Grid item md={6} className="force100">
                <Paper className={clsx(classes.paper, classes.root)} elevation={10}>
                    <Typography variant="h4" color="secondary">Registration</Typography>
                    <br /><br />
                    <TextField variant="outlined" margin="dense" id="r1" label="Full Name *" type="text" fullWidth onInput={$e => validate('name', $e.target.value)} />
                    <br />
                    {errors.name && errors.name !== "C" && <MuiAlert elevation={5} variant="outlined" severity="error">{errors.name}</MuiAlert>}
                    <br />
                    <TextField variant="outlined" margin="dense" id="r2" label="Email ID *" type="email" fullWidth onInput={$e => validate('email', $e.target.value)} />
                    <br />
                    {errors.email && errors.email !== "C" && <MuiAlert elevation={5} variant="outlined" severity="error">{errors.email}</MuiAlert>}
                    <br />
                    <TextField variant="outlined" margin="dense" id="r3" label="Contact Number *" type="number" fullWidth onInput={$e => validate('contact', $e.target.value)} />
                    <br />
                    {errors.contact && errors.contact !== "C" && <MuiAlert elevation={5} variant="outlined" severity="error">{errors.contact}</MuiAlert>}
                    <br />
                    <TextField variant="outlined" margin="dense" id="r4" label="RC ID *" type="number" fullWidth onInput={$e => validate('rcid', $e.target.value)} />
                    <br />
                    {errors.rcid && errors.rcid !== "C" && <MuiAlert elevation={5} variant="outlined" severity="error">{errors.rcid}</MuiAlert>}
                    <br />
                    <TextField variant="outlined" margin="dense" id="r5" label="College" type="text" fullWidth onInput={$e => setUser({ ...user, institueName: $e.target.value })} />
                    <br /><br />
                    <TextField variant="outlined" margin="dense" id="r6" label="Stream" type="text" fullWidth onInput={$e => setUser({ ...user, stream: $e.target.value })} />
                    <br /><br />
                    <TextField variant="outlined" margin="dense" id="r7" label="Year" type="number" fullWidth onInput={$e => setUser({ ...user, year: $e.target.value })} />
                    <br /><br />
                    <TextField variant="outlined" margin="dense" id="r8" label="Password *" type="password" fullWidth onInput={$e => validate('password', $e.target.value)} />
                    <br />
                    {errors.password && errors.password !== "C" && <MuiAlert elevation={5} variant="outlined" severity="error">{errors.password}</MuiAlert>}
                    <br />
                    <Button variant="contained" onClick={reg} color="secondary" disabled={!valid}> Register  </Button>
                </Paper>
            </Grid>
            <Grid item md={3} className="force100"></Grid>
        </Grid>
    );
};

export default Register;

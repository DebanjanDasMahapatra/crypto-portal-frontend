import React from "react";
import { configs } from "../../../globals";
import axios from "axios";
import { makeStyles, Paper, Grid } from "@material-ui/core";
import ContestAdmin from "./ContestAdmin/ContestAdmin";

const useStyles = makeStyles((theme) => ({
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    }
}));

const AllContests = (props) => {
    const { history, setLoading, setSnack, openConfirmation,socket } = props;
    const classes = useStyles();

    const [contests, setContests] = React.useState([]);
    const [auth, setAuth] = React.useState(false);

    const fetchContests = () => {
        axios.get(`${configs.baseUrl}/admin/getAllContest`).then(
            result => {
                if(result.data.status)
                {
                    setContests(result.data.data);
                }
                else
                    if(result.status === 401)
                        configs.logout(socket);
                setLoading(false);
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
            }
        ).catch(
            error => {
                setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
                setLoading(false);
            }
        )
    }

    React.useEffect(() => {
        if (!configs.isAdmin()) {
            history.push('/');
            setAuth(false);
        } else
        {
            document.title="Cryptoquest|All Contest";
            setAuth(true);
        }
    },[configs.isAdmin()]);

    React.useEffect(() => {
        if(!auth)   return;
        setLoading(true);
        fetchContests();
    }, [auth]);

    return (
        <>
            <br />
            <Grid container spacing={6}>
                {
                    contests.map(c => <Grid item md={4} key={c._id} style={{opacity: 0.9}}>
                        <Paper elevation={10}>
                            <ContestAdmin {...props} contest={c} fetchContests={fetchContests} openConfirmation={openConfirmation} setLoading={setLoading} setSnack={setSnack} />
                        </Paper>
                    </Grid>
                    )
                }
            </Grid>
        </>
    );
};

export default AllContests;

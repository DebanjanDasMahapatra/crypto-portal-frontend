import React from "react";
import { configs } from "../../../globals";
import axios from "axios";
import { Paper, Grid } from "@material-ui/core";
import ContestUser from "./ContestUser/ContestUser";

const Contests = (props) => {
    const { history, globalTime, setLoading, setSnack,socket } = props;
    const [contests, setContests] = React.useState([]);
    const [auth, setAuth] = React.useState(false);

    const fetchContests = () => {
        setLoading(true);
        axios.get(`${configs.baseUrl}/common/getAllContest`).then(
            result => {
                if (result.data.status) {
                    let cts = result.data.data;
                    cts.map(c => {
                        c.status = configs.flagRank(c, globalTime);
                    })
                    setContests(cts);
                }
                else
                {
                    if(result.status === 401)
                    {
                        configs.logout(socket);
                    }
                }
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
        if (!configs.isUser()) {
            history.push('/');
            setAuth(false);
        } else
        {
            document.title="CryptoQuest|Contests";
            setAuth(true);
        }
    },[configs.isUser()]);

    React.useEffect(() => {
        setContests(contests);
    }, [globalTime]);

    React.useEffect(() => {
        if (!auth) return;
        fetchContests();
    }, [auth]);

    return (
        <>
            <br />
            <Grid container spacing={6}>
                {
                    contests.map(contest => <Grid item md={4} key={contest._id} style={{opacity: 0.9}}>
                        <Paper elevation={10}>
                            <ContestUser {...props} contest={contest} />
                        </Paper>
                    </Grid>)
                }
            </Grid>
        </>
    );
};

export default Contests;

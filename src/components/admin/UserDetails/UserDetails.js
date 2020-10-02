import React from "react";
import axios from "axios";
import { configs } from "../../../globals";
import {withStyles, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);
  
const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);
  
const useStyles = makeStyles({
    table: {
      minWidth: 700,
    },
  });

  function Row(props) {
    const { k,i,openConfirmation,setLoading,setSnack,fetchUsers} = props;
    
    const deleteUser = () => {
        setLoading(true);
        axios.delete(`${configs.baseUrl}/admin/deleteUser/${k.email}`).then(
            result=> {
                if(result.data.status)
                {
                    setSnack({ show: true, msg: result.data.message, status: result.data.status });
                    fetchUsers();
                }
                else
                {
                    setLoading(false);
                    setSnack({ show: true, msg: result.data.message, status: result.data.status });
                }
            }
        ).catch(
            error => {
                setSnack({show: true, msg: "Failed to Connect to the Server...", status: false})
                setLoading(false);
            }
        )
    }

    const delU = () => {
        openConfirmation({title: "Confirm", content: `Sure to Delete the User ${k.email}?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: deleteUser})
    }
  
    return (
      <React.Fragment>
        <StyledTableRow key={k.email}>
            <StyledTableCell component="th" scope="row">
                {i+1}
            </StyledTableCell>
            <StyledTableCell align="center">{k.name}</StyledTableCell>
            <StyledTableCell align="center">{k.email}</StyledTableCell>
            <StyledTableCell align="center">{k.rcid}</StyledTableCell>
            <StyledTableCell align="center">{k.stream}</StyledTableCell>
            <StyledTableCell align="center">{k.year}</StyledTableCell>
            <StyledTableCell align="center">{k.instituteName}</StyledTableCell>
            <StyledTableCell align="center">{k.contact}</StyledTableCell>
            <StyledTableCell align="center"><IconButton color="secondary" onClick={delU}><DeleteIcon/></IconButton></StyledTableCell>
        </StyledTableRow>
      </React.Fragment>
    );
  }

const UserDetails = (props) => {
    const { history, setLoading, setSnack, openConfirmation,socket} = props;
    const classes = useStyles();
    const [userlist, setUserlist] = React.useState([]);
    const [auth, setAuth] = React.useState(false);


    React.useEffect(() => {
        if (!configs.isAdmin()) {
            setAuth(false);
            history.push('/');
        } else
        {
            setAuth(true);
            document.title="CryptoQuest|Userlist";
        }
    },[configs.isAdmin()]);

    React.useEffect(() => {
        if(!auth)   return;
        setLoading(true);
        fetchUsers();
    }, [auth]);

    const fetchUsers = () => {
        axios.get(`${configs.baseUrl}/admin/getAllUsers`).then(
            result => {
                if(result.data.status)
                {
                    let users = result.data.data;
                    setUserlist(users);
                }
                else
                {
                    if(result.status === 401)
                        configs.logout(socket);
                }
                setLoading(false);
                setSnack({ show: true, msg: result.data.message, status: result.data.status });
            }
        ).catch(
            error => {
                setSnack({show: true, msg: "Failed to Connect to the Server...", status: false})
                setLoading(false);
            }
        )
    }

    return(
        <>
            {userlist.length !== 0 && <TableContainer component={Paper} elevation={10} style={{opacity: 0.9}}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                <TableRow>
                    <StyledTableCell>#</StyledTableCell>
                    <StyledTableCell align="center">Name</StyledTableCell>
                    <StyledTableCell align="center">Email ID&nbsp;</StyledTableCell>
                    <StyledTableCell align="center">RC ID</StyledTableCell>
                    <StyledTableCell align="center">Stream</StyledTableCell>
                    <StyledTableCell align="center">Year</StyledTableCell>
                    <StyledTableCell align="center">College</StyledTableCell>
                    <StyledTableCell align="center">Contact</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {userlist.map((k,i) => (
                    <Row key={k.email} k={k} i={i} openConfirmation={openConfirmation} setLoading={setLoading} setSnack={setSnack} fetchUsers={fetchUsers}/>
                ))}
                </TableBody>
            </Table>
            </TableContainer>}
        </>
    )

}

export default UserDetails;
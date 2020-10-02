import React from "react";
import axios from "axios";
import "./AddQuestion.css";
import { configs } from "../../../globals";
import DeleteIcon from '@material-ui/icons/Delete';
import { Button, TextField, Grid, makeStyles, Paper, Typography, Link, List, ListItem, ListItemText, IconButton } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    textAlign: "center"
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    opacity: 0.9
  },
}));

const FileListing = (props) => {
  const {qid, fn, setLoading, setSnack, openConfirmation, loadData} = props;

  const deleteFile = () => {
    setLoading(true);
    axios.delete(`${configs.baseUrl}/admin/deleteFile/${qid}/${fn}`).then(result => {
      setSnack({ show: true, msg: result.data.message, status: result.data.status });
      loadData();
    }).catch(error => {
      setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
      setLoading(false);
    });
  };

  const delF = () => {
    openConfirmation({ title: "Confirm", content: `Delete File ${fn} for the Question ${qid}?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: deleteFile })
  };

  return <ListItem>
  <ListItemText><Link href={`${configs.baseUrl}/common/getFile/${qid}/${fn}`} color="error">{fn}</Link></ListItemText>
  <IconButton variant="contained" color="secondary" onClick={delF}><DeleteIcon /></IconButton>
</ListItem>
}

const AddQuestion = (props) => {

  const { history, setLoading, setSnack, openConfirmation, socket } = props;
  const classes = useStyles();

  const [question, setQuestion] = React.useState({
    title: "",
    description: "",
    flag: "",
    points: 0,
    author: "",
    questionFile: []
  });

  const [files, setFiles] = React.useState(null);
  const [filesV, setFilesV] = React.useState([]);
  const [filesN, setFilesN] = React.useState([]);
  const [auth, setAuth] = React.useState(false);

  const [id, setId] = React.useState(props.match.params.qid);
  const [targetCID, setTargetCID] = React.useState(props.match.params.cid);

  const loadData = () => {
    axios.get(`${configs.baseUrl}/admin/getQuestion/${id}`).then(
      result => {
        if (result.data.status) {
          const { title, description, points, flag, author, questionFile, _id } = result.data.data;
          setQuestion({ title, description, points, flag, author, questionFile });
          setId(title);
          setFilesV(questionFile);
        }
        else {
          if (result.status === 401)
            configs.logout(socket);
        }
        setSnack({ show: true, msg: result.data.message, status: result.data.status });
        setLoading(false);
      }
    ).catch(
      error => {
        setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
        setLoading(false);
      }
    )
  }

  const addQuestion = () => {
    setLoading(true);
    let formData = new FormData();
    formData.append('question', JSON.stringify(question));
    if(files)
      for (let file of files)
        formData.append('files[]', file, file.name);
    axios.post(`${configs.baseUrl}/admin/addQuestion/${targetCID === 'notselected' ? 'new' : targetCID}`, formData).then(result => {
      setSnack({ show: true, msg: result.data.message, status: result.data.status });
      if (result.data.status) {
        if(targetCID === 'notselected')
          socket.emit('new-question-added2', { title: question.title });
        else
          socket.emit('new-question-added', { title: [question.title], name: result.data.message.split(":")[1].trim(), cid: targetCID });
        resetAll();
      }
      else {
        setLoading(false);
      }
    }).catch(error => {
      setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
      setLoading(false);
    });
  };

  const addQ = () => {
    openConfirmation({ title: "Confirm", content: "Sure to Add the Question?", positiveButtonText: "YES", negativeButtonText: "NO", cb: addQuestion })
  };

  const editQuestion = () => {
    setLoading(true);
    let formData = new FormData();
    formData.append('question', JSON.stringify(question));
    if(files)
      for (let file of files)
        formData.append('files[]', file, file.name);
    axios.put(`${configs.baseUrl}/admin/editQuestion/` + id, formData).then(result => {
      setSnack({ show: true, msg: result.data.message, status: result.data.status });
      if (result.data.status) {
        socket.emit('question-edited', { title: question.title });
        setFiles(null)
        loadData();
      }
      else
        setLoading(false);
    }).catch(error => {
      setSnack({ show: true, msg: "Failed to Connect to the Server...", status: false });
      setLoading(false);
    });
  };

  const editQ = () => {
    openConfirmation({ title: "Confirm", content: `Save changes for the Question ${question.title}?`, positiveButtonText: "YES", negativeButtonText: "NO", cb: editQuestion })
  };

  const resetAll = () => {
    setQuestion({
      title: "",
      description: "",
      flag: "",
      points: 0,
      author: "",
      questionFile: []
    });
    setLoading(false);
  }

  React.useEffect(() => {
    if (!configs.isAdmin()) {
      setAuth(false);
      history.push('/');
    } else {
      setAuth(true);
      document.title = "CryptoQuest|" + (props.match.params.qid === 'new' ? "Add" : "Edit") + " Question";
    }
  }, [configs.isAdmin()]);

  React.useEffect(() => {
    if (!files)
      setFilesN([]);
    else {
      let arr = [];
      for (let i = 0; i < files.length; i++)
        arr.push(files.item(i).name)
      setFilesN(arr);
    }
  }, [files]);

  React.useEffect(() => {
    if (!auth) return;
    setTargetCID(props.match.params.cid);
    setId(props.match.params.qid);
  }, [props.match.params.cid, props.match.params.qid, auth]);

  React.useEffect(() => {
    resetAll();
    if (id !== 'new') {
      setLoading(true);
      loadData();
    }
  },[id])

  return (
    <>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item md={3} className="force100"></Grid>
          <Grid item md={6} className="force100">
            <Paper className={classes.paper} elevation={10}>
              <Typography variant="h5" color="secondary">{id === 'new' ? "Add New Question" : `Edit Question`}</Typography>
              {id !== 'new' && <h5>[<code>{id}</code>]</h5>}
              <code>{targetCID === 'notselected' ? "" : `This Question will be directly added in ${targetCID}`}</code>
              <br /><br />
              <TextField variant="outlined" margin="dense" id="r1" label="Title" type="text" fullWidth onInput={$e => setQuestion({ ...question, title: $e.target.value })} value={question.title} disabled={id !== 'new'} />
              {id === 'new' && <small><i>Once the question is added, you can't change the title !!!</i></small>}
              <br /><br />
              <TextField multiline variant="outlined" margin="dense" id="r2" label="Description" type="text" fullWidth onInput={$e => setQuestion({ ...question, description: $e.target.value })} value={question.description} />
              <br /><br />
              <TextField variant="outlined" margin="dense" id="r3" label="Flag" type="text" fullWidth onChange={$e => setQuestion({ ...question, flag: $e.target.value })} value={question.flag} />
              <br /><br />
              <TextField variant="outlined" margin="dense" id="r4" label="Points" type="number" fullWidth onChange={$e => setQuestion({ ...question, points: $e.target.value })} value={question.points} disabled={id !== 'new'} />
              {id === 'new' && <small><i>If the question is added in some contest or is already in a contest, you can't change the points !!!</i></small>}
              <br /><br />
              <TextField variant="outlined" margin="dense" id="r5" label="Author" type="text" fullWidth onInput={$e => setQuestion({ ...question, author: $e.target.value })} value={question.author} />
              <br /><br />
              <label htmlFor="r6">
                <Button variant="contained" component="span">
                  Choose Files
                </Button>
              </label>
              <input multiple id="r6" type="file" hidden onChange={$e => setFiles($e.target.files)} />
              <br />
              {
                filesN.length ? filesN.map(f => <React.Fragment key={f}>
                  <p>{f}</p>
                </React.Fragment>
                ) : <p>No Chosen Files</p>
              }
              <br /><List>
              {
                  
                filesV.length ? filesV.map(f => <React.Fragment key={f}>
                      <FileListing qid={id} fn={f} {...props} loadData={loadData} />
                    </React.Fragment>
                ) : <p>No Existing Files</p>
                
              }</List>
              <br />
              {id === 'new' && <Button variant="contained" color="secondary" onClick={addQ} disabled={question.description === "" || question.title === "" || question.points === "" || question.flag === "" || question.author === ""}>Add Question</Button>}
              {id !== 'new' && <Button variant="contained" onClick={editQ} disabled={question.description === "" || question.title === "" || question.points === "" || question.flag === "" || question.author === ""}>Edit Question</Button>}
            </Paper>
          </Grid>
          <Grid item md={3} className="force100"></Grid>
        </Grid>
      </div>
    </>
  );
};

export default AddQuestion;

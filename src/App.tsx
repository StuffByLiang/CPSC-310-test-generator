import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

const API_URL = "https://cs310.students.cs.ubc.ca/ui/query";
const DEFAULT_VALUE = JSON.stringify(JSON.parse(`{"WHERE":{"OR":[{"AND":[{"GT":{"courses_avg":90}},{"IS":{"courses_dept":"adhe"}}]},{"EQ":{"courses_avg":95}}]},"OPTIONS":{"COLUMNS":["courses_dept","courses_id","courses_avg"],"ORDER":"courses_avg"}}`), null, '\t')

function App() {
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [title, setTitle] = useState("Should return true");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);

  const fetchData = async () => {
    let response = "";

    try {
      const result = (await axios.post(API_URL, JSON.parse(value))).data.result;
      const file = {
        title,
        input: JSON.parse(value),
        errorExpected: false,
        with: result
      }
      response = JSON.stringify(file, null, 2);
      console.log(response)
      setError(false);
    } catch (error) {
      console.log(error);
      response = (error as any).message;
      if ((error as any)?.response?.data) {
        response += "\n\n" + JSON.stringify((error as any).response.data);
      }
      setError(true);
    } finally {
      setResult(response);
    }
  }

  return (
      <Container>
        <Typography variant="h2">CS310 Test Generator </Typography>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Box mb={1}>
              <TextField size="small" fullWidth value={title} variant="outlined" label="Test Case Title" onChange={(e) => setTitle(e.target.value)} />
            </Box>
            <AceEditor
              width="100%"
              mode="json"
              theme="github"
              onChange={setValue}
              value={value}
              name="id"
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true
              }}
            />
            <Box my={2} display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={() => fetchData()}>
                Submit
              </Button>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Test File"
              multiline
              fullWidth
              rows={25}
              value={result}
              error={error}
            />
          </Grid>
        </Grid>
      </Container>
  );
}

export default App;

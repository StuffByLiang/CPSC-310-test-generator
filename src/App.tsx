import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import { downloadFile } from "./utils/downloadFile";

// GOOGLE ANALYTICS
import ReactGA from "react-ga";
ReactGA.initialize("G-6G6T9722ZT");
ReactGA.pageview(window.location.pathname + window.location.search);

const API_URL = "https://cs310.students.cs.ubc.ca/ui/query";
const DEFAULT_VALUE = JSON.stringify(
  JSON.parse(
    `{"WHERE":{"OR":[{"AND":[{"GT":{"courses_avg":90}},{"IS":{"courses_dept":"adhe"}}]},{"EQ":{"courses_avg":95}}]},"OPTIONS":{"COLUMNS":["courses_dept","courses_id","courses_avg"],"ORDER":"courses_avg"}}`
  ),
  null,
  "\t"
);
const RESULT_TOO_LARGE_ERROR_MSG =
  "The result is too big. Only queries with a maximum of 5000 results are supported.";

function App() {
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [title, setTitle] = useState("Should return true");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);

  const fetchData = async () => {
    let response = "";
    let query = "";
    try {
      query = JSON.parse(value);
    } catch (e) {
      setError(true);
      const newLocal = "Invalid JSON provided\n\n" + (e as any).message;
      setResult(newLocal);
      return "";
    }

    try {
      const result = (await axios.post(API_URL, query)).data.result;
      const file = {
        title,
        input: query,
        errorExpected: false,
        with: result,
      };
      response = JSON.stringify(file, null, 2);
      setError(false);
    } catch (error) {
      let errorMsg = "";
      if ((error as any)?.response?.data?.error) {
        errorMsg = (error as any).response.data.error;
      }

      const file = {
        errorMsg,
        title,
        input: JSON.parse(value),
        errorExpected: true,
        with:
          errorMsg === RESULT_TOO_LARGE_ERROR_MSG
            ? "ResultTooLargeError"
            : "InsightError",
      };

      response = JSON.stringify(file, null, 2);
      setError(true);
    } finally {
      setResult(response);
    }
    return response;
  };

  return (
    <Container>
      <Typography variant="h2">CS310 Test Generator </Typography>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Box mb={1}>
            <TextField
              size="small"
              fullWidth
              value={title}
              variant="outlined"
              label="Test Case Title"
              onChange={(e) => setTitle(e.target.value)}
            />
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
              enableSnippets: true,
            }}
          />
          <Box my={2} display="flex" justifyContent="flex-end">
            <Box mr={1}>
              <Button variant="contained" onClick={() => fetchData()}>
                Submit
              </Button>
            </Box>
            <Button
              variant="contained"
              onClick={async () => {
                const response = await fetchData();
                downloadFile(response, title);
              }}
            >
              Download File
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

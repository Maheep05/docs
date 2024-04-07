import { Editor } from "./components/Editor";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { v4 } from "uuid";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate replace to={`/docs/${v4()}`} />}
        />
        <Route path="/docs/:id" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

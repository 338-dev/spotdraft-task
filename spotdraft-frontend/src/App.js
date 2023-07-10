import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login.component';
import Registration from './components/Registration/Registration.component';
import HomePage from './components/HomePage/HomePage.component';
import PDFViewer from './components/PDFViewer/PDFViewer.component';
import SharedPdfs from './components/HomePage/SharedPdfs.component';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/login" element={<Login/>} />
        <Route exact path="/registration" element={<Registration/>} />
        <Route exact path="/" element={<HomePage/>} />
        <Route exact path="/pdf-viewer" element={<PDFViewer/>} />
        <Route exact path="/pdf-viewer/:id" element={<PDFViewer/>} />
        <Route exact path="/shared-pdfs" element={<SharedPdfs/>} />
      </Routes>
    </Router>
  );
}

export default App;

import Notes from './components/Notes/notesView';
import KonvaTest from './components/Konva-Test/konvaView';
import MCQ from './components/MCQ/mcqView';

function App() {
  return <>
    <Notes />;
    <KonvaTest />
    <MCQ chapter={1} number={1} />
  </>
}

export default App;

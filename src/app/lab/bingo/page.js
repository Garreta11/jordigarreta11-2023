import BingoGame from './BingoGame';
import Loader from './Loader/Loader';
import { DataProvider } from './context';

function App() {
  return (
    <DataProvider>
      <div className='App'>
        <Loader />
        <BingoGame />
      </div>
    </DataProvider>
  );
}

export default App;

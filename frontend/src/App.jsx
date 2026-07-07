// import { BrowserRouter } from 'react-router-dom';
// import AppRoutes from './routes/AppRoutes';
// import { Toaster } from 'react-hot-toast';
// import { useAuth } from './hooks/useAuth';

// function App() {
//   useAuth();

//   return (
//     <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_36%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.12),_transparent_30%)] text-slate-200">
//       <BrowserRouter>
//         <AppRoutes />
//       </BrowserRouter>
//       <Toaster position="top-right" />
//     </div>
//   );
// }

// export default App;


import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";

function App() {
  useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <AppRoutes />

      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  );
}

export default App;
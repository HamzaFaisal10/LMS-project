import Logo from './components/Logo';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo />
      <p className="text-slate-500">
        Project scaffold ready — features coming in the next branches.
      </p>
    </div>
  );
}

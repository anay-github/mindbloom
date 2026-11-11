import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-[#ecf3ed]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            MindBloom helps schools notice wellness changes early — combining check-ins,
            participation, and weekly signals so counselors can support students sooner.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            MindBloom does not diagnose mental health conditions. It supports trusted adults
            with patterns and context.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="/#how" className="hover:text-foreground">How it works</a></li>
            <li><a href="/#detection" className="hover:text-foreground">Detection</a></li>
            <li><a href="/#skills" className="hover:text-foreground">Skill path</a></li>
            <li><a href="/#counselors" className="hover:text-foreground">Counselors</a></li>
            <li><a href="/#context" className="hover:text-foreground">School context</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">School</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="/student-dashboard" className="hover:text-foreground">Student dashboard</a></li>
            <li><a href="/counselor-dashboard" className="hover:text-foreground">Counselor dashboard</a></li>
            <li><a href="/signin" className="hover:text-foreground">Sign in</a></li>
            <li><a href="mailto:hello@mindbloom.app" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>

      </div>
      <div className="py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MindBloom. Made with care for student wellness.
      </div>

    </footer>
  );
}

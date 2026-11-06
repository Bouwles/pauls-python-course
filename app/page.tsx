import { Page } from "@/components/site/Page";
import { Clocktower } from "@/components/clocktower/Clocktower";
import { towerData } from "@/components/clocktower/data";

// Home is the Clocktower: everyone goes straight in, with no sign-up step. Progress is kept in the
// browser, and an account (local version only) is for joining a class. /about has the old landing page.
export default function Home() {
  const { acts, placements, names, steps } = towerData();
  return (
    <Page>
      <Clocktower acts={acts} placements={placements} names={names} steps={steps} />
    </Page>
  );
}

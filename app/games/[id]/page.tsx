import { GameView } from "./GameView";

export default async function GameDetailPage(props: PageProps<"/games/[id]">) {
  const { id } = await props.params;
  return <GameView id={id} />;
}

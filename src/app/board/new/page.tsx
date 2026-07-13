import { getSiteText } from "@/lib/siteText";
import { NewPostForm } from "@/components/board/NewPostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const boardName = await getSiteText("board.name");
  return <NewPostForm boardName={boardName} />;
}

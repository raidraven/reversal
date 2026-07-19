import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteText } from "@/lib/siteText";
import { NewPostForm } from "@/components/board/NewPostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  const boardName = await getSiteText("board.name");
  return <NewPostForm boardName={boardName} isLoggedIn={!!session?.user?.id} />;
}

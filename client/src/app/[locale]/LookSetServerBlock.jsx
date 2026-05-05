import { getActiveCharacters } from "@shared";
import LookSet from "@widgets/look-set";

export default async function LookSetServerBlock() {
  const result = await getActiveCharacters();

  if (!result.ok) {
    return (
      <LookSet
        fetchState="error"
        errorMessage={result.message}
        httpStatus={result.status}
      />
    );
  }

  const items = result.items ?? [];
  if (items.length === 0) {
    return <LookSet fetchState="empty" looks={[]} />;
  }

  return <LookSet fetchState="success" looks={items} />;
}

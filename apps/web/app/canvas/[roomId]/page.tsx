import RoomCanvas from "../../../components/RoomCanvas";

export default async function CanvasPage({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  const roomId = (await params).roomId;
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <RoomCanvas roomId={roomId} />
    </div>
  );
}

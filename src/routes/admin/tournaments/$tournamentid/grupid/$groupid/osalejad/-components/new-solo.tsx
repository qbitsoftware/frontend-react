import { Input } from "@/components/ui/input";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Participant } from "@/types/participants";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Pencil, Trash, X } from "lucide-react";
import { useParticipantForm } from "@/providers/participantProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { capitalize, useDebounce } from "@/lib/utils";
import { UseGetUsersDebounce } from "@/queries/users";

export const NewSolo = () => {
  const { participantsState } = useParticipantForm();
  const participants = participantsState ? participantsState : [];

  const [disableOrderring, setDisableOrdering] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log(active.id, over?.id);
    // if (active.id !== over?.id) {
    //     const updatedParticipants = arrayMove(participants,
    //         participants.findIndex((item) => item.id === active.id),
    //         participants.findIndex((item) => item.id === over?.id)
    //     )
    //     participants = updatedParticipants
    // }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <div className="mt-10 ">
      <div className="flex flex-col mt-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={participants.map((participant) => participant.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                <TableRow className="bg-gray-50 border-b hover:bg-gray-50">
                <TableHead className="">Pos.</TableHead>
                    <TableHead>Muuda</TableHead>
                    <TableHead>Nimi</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Reiting</TableHead>
                    <TableHead>Sugu</TableHead>
                    <TableHead>Synniaasta</TableHead>
                    <TableHead>Klubi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="">
                  {participants &&
                    participants.map((participant, key) => (
                      <ParticipantDND
                        key={participant.id}
                        participant={participant}
                        index={key}
                        disableOrdering={disableOrderring}
                        setDisableOrdering={setDisableOrdering}
                      />
                    ))}
                </TableBody>
              </Table>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

interface Props {
  participant: Participant;
  index: number;
  disableOrdering: boolean;
  setDisableOrdering: (value: boolean) => void;
}

function ParticipantDND({
  participant,
  index,
  disableOrdering,
  setDisableOrdering,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: participant.id });

  const [editing, setIsEditing] = useState(false);

  const [participantState, setParticipantState] =
    useState<Participant>(participant);

  const updateField = (field: string, value: any) => {
    setParticipantState((prevState) => {
      if (!field.includes(".")) {
        return {
          ...prevState,
          [field]: value,
        };
      }

      const pathParts = field.split(".");
      const newState = { ...prevState };

      if (pathParts[0] === "players") {
        const playerIndex = parseInt(pathParts[1]);
        const playerField = pathParts[2];

        if (pathParts.length === 4 && playerField === "extra_data") {
          const extraDataField = pathParts[3];
          newState.players = [...newState.players];
          newState.players[playerIndex] = {
            ...newState.players[playerIndex],
            extra_data: {
              ...newState.players[playerIndex].extra_data,
              [extraDataField]: value,
            },
          };
        } else {
          newState.players = [...newState.players];
          newState.players[playerIndex] = {
            ...newState.players[playerIndex],
            [playerField]: value,
          };
        }
      }

      return newState;
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: playerSuggestions } = UseGetUsersDebounce(debouncedSearchTerm);

  // const { t } = useTranslation()

  useEffect(() => {
    if (debouncedSearchTerm) {
      const timeout = setTimeout(() => setPopoverOpen(true), 50);
      return () => clearTimeout(timeout);
    } else {
      setPopoverOpen(false);
    }
  }, [debouncedSearchTerm]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setDisableOrdering(true);
  };

  const handleStopEditing = () => {
    setIsEditing(false);
    setDisableOrdering(false);
  };

  const handleSubmit = () => {
    console.log("submitting change");
    handleStopEditing();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="bg-card rounded-lg shadow-sm hover:shadow-md hover:bg-stone-100/40 "
    >
      <TableCell className="text-center">
        {}
        {disableOrdering ? (
          <div className="flex items-center justify-center hover:bg-indigo-50 gap-1 p-2 rounded-sm">
            {index + 1}
            <GripVertical className="h-4 w-4" />
          </div>
        ) : (
          <div
            className="flex items-center justify-center hover:bg-sky-100/40 gap-1 p-2 rounded-sm"
            {...attributes}
            {...listeners}
          >
            {index + 1}
            <GripVertical className="h-4 w-4" />
          </div>
        )}
      </TableCell>
      <TableCell className="text-center ">
        {editing ? (
          <div className="flex gap-2">
            <div className="h-8 w-8 flex items-center justify-center bg-green-100 cursor-pointer rounded-sm">
              <Check className="h-4 w-4" onClick={handleSubmit} />
            </div>
            <div className="h-8 w-8 flex items-center justify-center bg-stone-100 cursor-pointer rounded-sm">
              <X
                className="h-4 w-4 cursor-pointer"
                onClick={handleStopEditing}
              />
            </div>
            <div className="h-8 w-8 flex items-center justify-center bg-red-100 cursor-pointer rounded-sm">
              <Trash
                className="h-4 w-4 cursor-pointer"
                onClick={handleStopEditing}
              />
            </div>
          </div>
        ) : (
          <Pencil
            className="h-4 w-4 cursor-pointer"
            onClick={handleStartEditing}
          />
        )}
      </TableCell>
      <TableCell className="font-medium">
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open);
          }}
        >
          <PopoverTrigger asChild>
            <Input
              className="w-[180px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
              type="text"
              disabled={!editing}
              placeholder="Participant name"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // setName(e.target.value)
                updateField("name", e.target.value);
              }}
              value={participantState.name}
            />
          </PopoverTrigger>
          {playerSuggestions && playerSuggestions.data && (
            <PopoverContent
              className="p-0 w-[200px] max-h-[400px] overflow-y-auto suggestion-dropdown"
              align="start"
              sideOffset={5}
              onInteractOutside={(e) => {
                if ((e.target as HTMLElement).closest("input")) {
                  e.preventDefault();
                } else {
                  setPopoverOpen(false);
                }
              }}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              {playerSuggestions?.data.map((user, i) => (
                <div
                  key={i}
                  className="px-3 py-2 cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setPopoverOpen(false);
                    updateField(
                      "name",
                      `${capitalize(user.first_name)} ${capitalize(user.last_name)}`
                    );
                    updateField("players.0.first_name", user.first_name);
                    updateField("players.0.last_name", user.last_name);
                    updateField("players.0.user_id", user.id);
                    updateField(
                      "players.0.extra_data.rate_order",
                      user.rate_order
                    );
                    updateField("players.0.extra_data.club", user.club_name);
                    updateField("players.0.extra_data.eltl_id", user.eltl_id);
                    updateField(
                      "players.0.extra_data.rate_points",
                      user.rate_points
                    );
                    updateField("rank", user.rate_points);
                    updateField("players.0.sex", user.sex);
                  }}
                >
                  {capitalize(user.first_name)} {capitalize(user.last_name)}{" "}
                  {user.eltl_id}
                </div>
              ))}
            </PopoverContent>
          )}
        </Popover>
      </TableCell>
      <TableCell className="text-center">
        <Input
          className="w-[40px] p-0 disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
          disabled
          placeholder="ELTL ID"
          value={participantState.players[0].extra_data.eltl_id}
        />
      </TableCell>
      <TableCell className="text-center">
        <Input
          className="w-[60px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
          disabled={!editing}
          placeholder="Rank"
          onChange={(e) => updateField("rank", Number(e.target.value))}
          value={participantState.rank}
        />
      </TableCell>
      <TableCell className="text-center">
        <Select
          value={participantState.players[0].sex}
          disabled={!editing}
          onValueChange={(value) => updateField("players.0.sex", value)}
        >
          <SelectTrigger className="w-[80px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900">
            <SelectValue placeholder="Sex" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sex</SelectLabel>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="N">N</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center">
        <Input
          className="w-[120px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
          type="date"
          disabled={!editing}
          placeholder="YOB"
          onChange={(e) => updateField("players.0.created_at", e.target.value)}
          value={participantState.players[0].created_at}
        />
      </TableCell>
      <TableCell className="text-center">
        <Input
          className="w-[160px] disabled:p-0 disabled:bg-transparent disabled:border-none disabled:opacity-100 disabled:cursor-default disabled:text-stone-900"
          disabled={!editing}
          placeholder="Club name"
          onChange={(e) =>
            updateField("players.0.extra_data.club", e.target.value)
          }
          value={participantState.players[0].extra_data.club}
        />
      </TableCell>
    </TableRow>
  );
}

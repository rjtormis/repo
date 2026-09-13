import { toast } from "@/components/ui/toast"

export function showRemovedToast(name: string, onUndo: () => void) {
  const id = toast.add({
    title: `${name} removed`,
    timeout: 4000,
    actionProps: {
      children: "Undo",
      onClick: () => {
        toast.close(id)
        onUndo()
      },
    },
  })
}

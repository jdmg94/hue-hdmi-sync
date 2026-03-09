import type { ReactNode } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog"

interface ModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	children?: ReactNode
	footer?: ReactNode
}

export function Modal({
	open,
	onOpenChange,
	title,
	description,
	children,
	footer,
}: ModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && (
						<DialogDescription>{description}</DialogDescription>
					)}
				</DialogHeader>
				{children}
				{footer && <DialogFooter showCloseButton>{footer}</DialogFooter>}
				{!footer && <DialogFooter showCloseButton />}
			</DialogContent>
		</Dialog>
	)
}

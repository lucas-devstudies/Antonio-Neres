export type ColumnId = 'TO_DO' | 'IN_PROGRESS' | 'DONE'

export interface TaskBasic {
    id: string,
    name: string,
    email: string,
    phone: string,
    city: string,
    address: string,
    degree: string,
    amount: number,
    status: ColumnId,
    position: number,
    ticketNote?: TicketNote,
}

export interface TaskAll{
    id: string,
    name: string,
    email: string,
    phone: string,
    city: string,
    address: string,
    bundle: string,
    degree: string,
    amount: number,
    motive: string,
    indication: string,
    status: ColumnId,
    position: number,
    ticketNote?: TicketNote,
}

export interface TicketNote {
    name_user: string,
    comment: string,
}
export interface ManageTicket{
    status: string,
    position: number,
}
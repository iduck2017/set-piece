class TicketService {
    private _ticket = 1;

    public query() {
        this._ticket += 1;
        return this._ticket.toString(36);
    }
}

export const ticketService = new TicketService();
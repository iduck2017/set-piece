class TicketService {
    protected _timestamp = Date.now();
    protected _ticket = 36 ** 7;

    public query() {  
        this._ticket += 1;
        if (this._ticket >= 36 ** 8) {
            this._ticket = 36 ** 7;
            while (Date.now() === this._timestamp) {}
            this._timestamp = Date.now();
        };
        return `${this._timestamp.toString(36)}-${this._ticket.toString(36)}`;
    }
}

export const ticketService = new TicketService();


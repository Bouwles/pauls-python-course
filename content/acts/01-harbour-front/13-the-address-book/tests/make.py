TESTS = [
    output("Bea twice, and the captain",
           inputs=["Bea Hollis", "Captain Ferro", "The Ferry Office, North Quay", "Bea Hollis", ""],
           expect="Bea Hollis: The Bakery, Quay Row\nNo address for Captain Ferro.\nBea Hollis: The Bakery, Quay Row\n"
                  "Round:\nBea Hollis, The Bakery, Quay Row: 2\nCaptain Ferro, The Ferry Office, North Quay: 1",
           visible=True),
    output("One parcel for Tom", inputs=["Old Tom", ""],
           expect="Old Tom: The Lighthouse, Point Road\nRound:\nOld Tom, The Lighthouse, Point Road: 1", visible=True),
    output("Book order, not arrival order", inputs=["Gwen", "Agnes Rook", "Gwen", ""],
           expect="Gwen: The Drowned Anchor, Quay Row\nAgnes Rook: Harbour Office, North Quay\nGwen: The Drowned Anchor, Quay Row\n"
                  "Round:\nAgnes Rook, Harbour Office, North Quay: 1\nGwen, The Drowned Anchor, Quay Row: 2",
           hint="The round goes in book order: loop over book.items(), not over the names as they came in."),
    output("A new name, twice", inputs=["Nell Brannigan", "The Scrapyard, Mill Lane", "Nell Brannigan", ""],
           expect="No address for Nell Brannigan.\nNell Brannigan: The Scrapyard, Mill Lane\n"
                  "Round:\nNell Brannigan, The Scrapyard, Mill Lane: 2",
           hint="Once a new name is added, it's in the book like anyone else. Its second parcel should find the address."),
    output("Two new names", inputs=["Mrs Vance", "The Library, Chapel Street", "Mr Okonjo", "The Tailor's, Quay Row", ""],
           expect="No address for Mrs Vance.\nNo address for Mr Okonjo.\n"
                  "Round:\nMrs Vance, The Library, Chapel Street: 1\nMr Okonjo, The Tailor's, Quay Row: 1"),
    output("Nobody today", inputs=[""], expect="Round:\nNothing to deliver.",
           hint="With no parcels at all, the line after Round: should be Nothing to deliver."),
]

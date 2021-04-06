# Design

Our project was centered around adding persistence to Covey.Town, which was accomplished through the use of a MongoDB database. As such, the substantive changes were primarily adding in an entire database folder inside the “service/roomService” directory to deal with connecting to this database, implementing functionality using it, and then closing it. Once new functionality was available through this database connection, it was necessary to integrate with the existing codebase. The resulting workflow arose:

![Data Flow](docs/dataflow.jpg)

The new routes added to accommodate all our proposed functionality are as follows:

![Routes](docs/routes.jpg)
# Backup and restore

Use MongoDB Atlas backup features or the MongoDB database team's approved backup process for hosted deployments. For a self-managed development database, `mongodump` and `mongorestore` may be used.

Example for a local disposable database:

```bash
mongodump --uri="mongodb://127.0.0.1:27017/tyagiji_learning" --out ./backup
mongorestore --uri="mongodb://127.0.0.1:27017/tyagiji_learning_restore_test" ./backup/tyagiji_learning
```

- Store backups encrypted and separately from the application host.
- Do not commit backups, database dumps or connection strings.
- Define recovery point and recovery time objectives before production launch.
- Test restores periodically using an isolated database and confirm users, courses, enrollments and progress are present.
- Follow privacy and retention requirements when storing or deleting backups.

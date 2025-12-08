# Resetting ntopng Admin Password in Docker (TrueNAS Scale)

This guide documents the exact steps for resetting the **ntopng admin password** when running ntopng inside a Docker container on TrueNAS Scale.


## Steps

### 1. Enter the container shell

Use the TrueNAS Shell or exec into the container via UI:

```
sh
```

(You should see a BusyBox/Alpine-style shell.)

### 2. Open Redis CLI

```
redis-cli
```

### 3. Delete all admin-related Redis keys

Run each command inside `redis-cli`:

```
del ntopng.user.admin.password
del ntopng.user.admin.full_name
del ntopng.user.admin.group
del ntopng.user.admin.language
del ntopng.user.admin.allowed_nets
del ntopng.user.admin.date_format
del ntopng.user.admin.theme
del ntopng.user.admin.dismissed_toasts.toast_2
del ntopng.user.admin.dismissed_toasts.toast_12
del ntopng.user.admin.dismissed_toasts.toast_15
del ntopng.user.admin.dismissed_toasts.toast_23
```

### 4. Confirm deletion

```
keys ntopng.user.admin.*
```

It should return no keys.

### 5. Exit Redis

```
exit
```

### 6. Restart ntopng

Inside the container:

```
pkill ntopng
ntopng
```

### 7. Log in

Use default credentials:

```
admin / admin
```


This resets the admin account cleanly by removing its stored Redis values, forcing ntopng to recreate it with default credentials.

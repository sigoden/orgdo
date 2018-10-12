# orgdo-cli

> cli tools for orgdo

```
orgdo list --tags myproject,backend
orgdo list --tags myproject --tags backend
orgdo list --priority low
orgdo list --status done,cancel
orgdo list --name email*
orgdo list --start 3
orgdo list --started >-3
orgdo list --complete >3
orgdo list --completed -3
orgdo list --with-statistic
orgdo list --only-statistic
```

```
orgdo edit --tags myproject,backend name
orgdo edit --start 3 name
orgdo edit --complete 3 name
orgdo edit --desc 'you can search google' name
orgdo edit --priority high name
```

```
# cannot edit when status is cancel or done
orgdo edit @id
```

```
orgdo start @id
orgdo cancel @id
orgdo done @id
```

```
# cannot remove when status is cancel or done
orgdo rm @id
```
#!/bin/bash

# Do some cleanup
rm -rf ./bin/hyperdrive

# Set some things
VERSION=$(git describe --tags --always --abbrev=1)
OUTPUT="./bin/hyperdrive"

# Set our headers
echo -e "Kicking off a build..."
echo -e "#!/bin/bash" > $OUTPUT
echo -e "HYPERDRIVE_VERSION=$VERSION\n" >> $OUTPUT

# Add our libraries to the top of things
for LIB in ./lib/*.sh; do
  echo -e "Loading in $LIB"
  echo -e "$(tail -n +2 $LIB)" >> $OUTPUT
done

# Add our checks next
for CHECK in ./checks/*.sh; do
  echo -e "Loading in $CHECK"
  echo -e "$(tail -n +2 $CHECK)" >> $OUTPUT
done

# Add our installers next
for INSTALLER in ./installers/*.sh; do
  echo -e "Loading in $INSTALLER"
  echo -e "$(tail -n +2 $INSTALLER)" >> $OUTPUT
done

# Finally, add in the hyperdrive
echo -e "Addiding in the core navicomputer"
echo -e "$(tail -n +2 ./hyperdrive.sh)" >> $OUTPUT

# Set as executable
echo -e "Executing ./bin/hyperdrive"
chmod +x $OUTPUT

echo -e "Done! Compiled script to ./bin/hyperdrive"
echo -e "You can run the scipt now with ./bin/hyperdrive"
exit 0

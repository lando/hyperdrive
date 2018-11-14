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

# Append our libraries to the top of things
for LIB in ./lib/*.sh; do
  echo -e "Loading in $LIB"
  echo -e "$(tail -n +2 $LIB)" >> $OUTPUT
done

# Add in the hyperdrive
echo -e "Addiding in the core navicomputer"
echo -e "$(tail -n +2 ./hyperdrive.sh)" >> $OUTPUT

# Set as executable
echo -e "Executing ./bin/hyperdrive"
chmod +x $OUTPUT

echo -e "Done! Compiled script to ./bin/hyperdrive"
echo -e "You can run the scipt now with ./bin/hyperdrive"
exit 0

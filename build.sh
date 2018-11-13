#!/bin/bash

# Do some cleanup
rm -rf ./bin/hyperdrive

# Set some things
VERSION=$(git describe --tags --always --abbrev=1)
OUTPUT="./bin/hyperdrive"

# Set our headers
echo -e "#!/bin/bash" > $OUTPUT
echo -e "HYPERDRIVE_VERSION=$VERSION\n" >> $OUTPUT

# Append our libraries to the top of things
for LIB in ./lib/*.sh; do
  echo -e "$(tail -n +2 $LIB)" >> $OUTPUT
done

# Add in the hyperdrive
echo -e "$(tail -n +2 ./hyperdrive.sh)" >> $OUTPUT

# Set as executable
chmod +x $OUTPUT


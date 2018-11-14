#!/bin/bash
source ./lib/error.sh

# Error if no $1
if [ -z "$1" ]; then
  error "You need to specify a version eg './release.sh v0.1.0'"
fi

# Set our vars
OLD_VERSION=$(git describe --abbrev=0)
NEW_VERSION=$1
GIT_MESSAGE="Release $1"
ANNOTATION=${2:-$GIT_MESSAGE}

# Print some helpful things
echo -e ""
echo -e "About to bump from $OLD_VERSION to $NEW_VERSION with annotation: \"$ANNOTATION\"..."
echo -e ""

# Var our commands
README_UPDATE=(sed -i "s/$OLD_VERSION/$NEW_VERSION/g" ./README.md)
GIT_ADD=(git add --all)
GIT_COMMIT=(git commit -m "\"$GIT_MESSAGE\"")
GIT_TAG=(git tag -a "$NEW_VERSION" -m "\"$ANNOTATION\"")
GIT_PUSH_BRANCH=(git push origin master)
GIT_PUSH_TAG=(git push origin master "$NEW_VERSION")

# Describe to the user what is going to happen and ask for their permission
# to proceedets make a note to review this in our retro or whatever we do
echo -e "\033[35mPlease verify these are the release commands you are looking for?\033[39m"

# Print the commands
echo -e "\033[32m"
printf '%s ' "${README_UPDATE[@]}" && echo -e ""
printf '%s ' "${GIT_ADD[@]}" && echo -e ""
printf '%s ' "${GIT_COMMIT[@]}" && echo -e ""
printf '%s ' "${GIT_TAG[@]}" && echo -e ""
printf '%s ' "${GIT_PUSH_BRANCH[@]}" && echo -e ""
printf '%s ' "${GIT_PUSH_TAG[@]}" && echo -e ""
echo -e "\033[39m"

# Show confirm message if we aren't in autoyes
read -r -p "Shall we run them and create a new release? [Y/n]" CONFIRM
case $CONFIRM in
  [yY][eE][sS]|[yY])
    echo -e "Begining release cycle!"
    echo -e "Updating Readme..."
    "${README_UPDATE[@]}"
    echo -e "Commiting the codes"
    "${GIT_COMMIT[@]}"
    echo -e "Tagging the versions"
    "${GIT_TAG[@]}"
    echo -e "Cutting the $NEW_VERSION release"
    "${GIT_PUSH[@]}"
    ;;
  [nN][oO]|[nN])
    error "So be it!" 0
    ;;
  *)
    error "Invalid response..." 5
    ;;
esac

exit 0


#git tag -a v0.0.1 -m "Initial release to test shit"

#git push origin master && git push origin master v0.1.0


echo "STUFF"
# Build the recommendDRYed commands
# GIT_COMMANDS=
#sed -i 's/original/new/g' file.txt
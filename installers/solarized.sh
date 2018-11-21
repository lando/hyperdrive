#!/bin/bash

# Fix solarized theme if neededs
fix_solarized() {
  # SOLARIZED
  BASE0='#838394949696'
  BASE1='#9393a1a1a1a1'
  BASE3='#fdfdf6f6e3e3'
  BASE00='#65657b7b8383'
  BASE01='#58586e6e7575'
  BASE03='#00002B2B3636'
  SOLARIZED_PALETTE='#070736364242:#DCDC32322F2F:#858599990000:#B5B589890000:#26268B8BD2D2:#D3D336368282:#2A2AA1A19898:#EEEEE8E8D5D5:#00002B2B3636:#CBCB4B4B1616:#58586E6E7575:#65657B7B8383:#838394949696:#6C6C7171C4C4:#9393A1A1A1A1:#FDFDF6F6E3E3'
  # OS DEFUALTS
  DEFAULT_ELEMENTARY_PALETTE='#303030:#e1321a:#6ab017:#ffc005:#004f9e:#ec0048:#2aa7e7:#f2f2f2:#5d5d5d:#ff361e:#7bc91f:#ffd00a:#0071ff:#ff1d62:#4bb8fd:#a020f0'
  # Do distro specific stuff
  case $OS in
    elementary)
      gsettings set io.elementary.terminal.settings background $BASE03
      gsettings set io.elementary.terminal.settings foreground $BASE0
      gsettings set io.elementary.terminal.settings cursor-color $BASE0
      gsettings set io.elementary.terminal.settings palette $SOLARIZED_PALETTE
      ;;
  esac
}

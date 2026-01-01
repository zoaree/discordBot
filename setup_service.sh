#!/bin/bash

# Renkli çıktılar
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Zoare Bot Otomatik Başlatma Kurulumu...${NC}"

# Root kontrolü
if [ "$EUID" -ne 0 ]
  then echo -e "${RED}Lütfen bu scripti yönetici olarak çalıştırın: sudo bash setup_service.sh${NC}"
  exit
fi

SERVICE_NAME="discordbot.service"
SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME"
CURRENT_PATH=$(pwd)

# Service dosyasını düzenle (Path garantileme)
# (Dosyadaki pathler zaten doğru ayarlandı: /home/kadiroski/Desktop/DiscortBot)

echo "1. Servis dosyası kopyalanıyor..."
cp $CURRENT_PATH/discordbot.service $SERVICE_PATH

echo "2. İzinler ayarlanıyor..."
chmod 644 $SERVICE_PATH

echo "3. Systemd yenileniyor..."
systemctl daemon-reload

echo "4. Servis başlatılıyor ve etkinleştiriliyor..."
systemctl stop $SERVICE_NAME 2>/dev/null # Varsa durdur
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

echo "5. Durum kontrolü..."
systemctl status $SERVICE_NAME --no-pager

echo -e "${GREEN}>>> Kurulum Tamamlandı! Bot artık PC açıldığında otomatik çalışacak.${NC}"
echo "Logları izlemek için: sudo journalctl -u discordbot -f"

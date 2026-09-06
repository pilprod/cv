# Илья Папоу — проекты, код и фотографии лаборатории

[English version](https://papou.work/portfolio.html) · [Резюме](https://papou.work/ru/) · [LinkedIn](https://www.linkedin.com/in/pilprod/) · [GitHub](https://github.com/pilprod)

## Agent Orchestration Infrastructure

Июн 2026 – н. в. · Буэнос-Айрес, Аргентина · Личный R&D · PoC

Личный R&D-проект для разработчиков и AI-агентов: совместная работа над ПО и инфраструктурой, передача задач с сохранением контекста, подключение инструментов и проверка человеком.

Компоненты платформы развёрнуты в Google Cloud. Оркестрация и согласование включают спроектированные и подготовленные решения. Контракты Agent Host проверены с имитацией провайдеров. Полное сквозное развёртывание системы в production не заявляется.

[Проект в CV](https://papou.work/ru/#projects) · [LinkedIn Projects](https://www.linkedin.com/in/pilprod/details/projects/) — Agent Orchestration Infrastructure · Personal R&D · PoCs · [LinkedIn Experience](https://www.linkedin.com/in/pilprod/details/experience/) — Agent Infrastructure Engineer · Personal R&D · PoCs

- [Platform infrastructure](https://github.com/pilprod/yourown-chat): Инфраструктура Google Cloud и конфигурация поставки для платформы чата и агентов. Terraform, Helm и пайплайны выпуска.
- [Agent runtime](https://github.com/pilprod/substrate): Форк Substrate для интеграции внешних worker-процессов и Agent Host. Форк kagent-dev/substrate. Исходный код upstream-проекта и собственная интеграция разделены.
- [kagent fork](https://github.com/pilprod/kagent): Форк платформы оркестрации агентов в Kubernetes для интеграционных экспериментов. Форк kagent-dev/kagent. Авторство исходного upstream-проекта не заявляется.
- [kagent integration](https://github.com/pilprod/yourown-chat-kagent): Контракты интеграции, зафиксированные версии исходного кода и релизов, конфигурация тестового стенда. Слой интеграции и проверки совместимости, отдельный от форка kagent.
- [Mattermost fork](https://github.com/pilprod/mattermost): Форк self-hosted командного чата с серверными исправлениями и процессами сборки контейнеров. Форк mattermost/mattermost. Авторство и лицензирование upstream-проекта сохраняются отдельно.
- [Runtime image build](https://github.com/pilprod/yourown-chat-mattermost): Конфигурация сборки серверного и веб-подмодулей Mattermost в образ для запуска. Содержит зависимость от закрытого веб-подмодуля. Одного публичного среза недостаточно для полной сборки.
## Home Aeroponics & IoT automation

Авг 2024 – Янв 2025 · Москва, Россия · Личный R&D

Аэропонная лаборатория: электроника и датчики, прошивки на C++, автоматизация на Python, MQTT и мониторинг через Home Assistant.

Фотографии показывают лабораторию в период работы над проектом. Публичные репозитории — отдельные архивные срезы, а не вся установка. Возможность сборки и безопасность системы в её нынешнем виде не подтверждены.

[Проект в CV](https://papou.work/ru/#home-aeroponics) · [LinkedIn Projects](https://www.linkedin.com/in/pilprod/details/projects/) — Home Aeroponics & IoT automation · Personal R&D · [LinkedIn Experience](https://www.linkedin.com/in/pilprod/details/experience/) — IoT & Automation Engineer · Personal R&D

- [Controllers and integration](https://github.com/pilprod/aeroponics-iot-control): Контроллеры климатических устройств на Python/MQTT и очищенные примеры Mosquitto и Zigbee2MQTT. Архивный срез, а не полная конфигурация Home Assistant. Проверка всей интеграции и безопасности оборудования не заявляется.
- [Sensor firmware](https://github.com/pilprod/aeroponics-sensor-firmware): Пять архивных Arduino-прототипов: измерение света, телеметрия воды и эксперименты с управлением реле. Экспериментальные варианты исходного кода 2024 года, не готовые решения и не релизы с проверенной сборкой. Для каждого скетча указаны зависимости, незавершённые интеграции и ограничения безопасности оборудования.
  - [Light sensors with JSON/MQTT](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/uno/uno.ino): архивный прототип, не готовое решение. Прототип на Arduino Uno R4 WiFi. Отсутствует модифицированная библиотека датчиков, не определены экземпляры программного I2C и не зарегистрирован обработчик сообщений.
  - [Light sensors with Serial output](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/tcs34725_serial/tcs34725_serial.ino): архивный прототип, не готовое решение. Четыре датчика TCS34725 на отдельных программных шинах I2C. Модифицированная зависимость Adafruit отсутствует. MQTT не используется.
  - [pH and relay commands](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/ph_relay_serial/ph_relay_serial.ino): архивный прототип, не готовое решение. Эксперимент с измерением pH и управлением реле через Serial. Без MQTT. Калибровка и состояния реле на оборудовании не проверены.
  - [EC/TDS and Serial1 relay commands](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/ec_tds_relay_serial/ec_tds_relay_serial.ino): архивный прототип, не готовое решение. Эксперимент с датчиками воды и реле. MQTT подключается, но в этом варианте не публикует телеметрию.
  - [pH and moisture telemetry](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/ph_moisture_mqtt/ph_moisture_mqtt.ino): архивный прототип, не готовое решение. pH и два аналоговых входа влажности с усреднением и JSON/MQTT. Калибровка, преобразование значений и периодический сброс не проверены.
## Zero-Trust Mesh & Open-source NGFW

Янв 2025 – Мар 2025 · Бангкок, Таиланд · Личный R&D

Многорегиональная лабораторная сеть Tailscale с автоматической настройкой узлов, политиками доступа через GitOps и сетевыми экспериментами на OPNsense.

Опубликованы очищенные лабораторные примеры. В них нет актуальных списков узлов и учётных данных. Развёртывание примеров именно в опубликованном виде не заявляется.

[Проект в CV](https://papou.work/ru/#zero-trust-mesh) · [LinkedIn Projects](https://www.linkedin.com/in/pilprod/details/projects/) — Zero-Trust Mesh & Open-source NGFW · Personal R&D · [LinkedIn Experience](https://www.linkedin.com/in/pilprod/details/experience/) — Network & Security Engineer · Personal R&D

- [Node automation](https://github.com/pilprod/lab-network-automation): Установка, регистрация и настройка сети для лабораторных узлов Tailscale через Ansible. Очищенные примеры автоматизации без частных списков узлов и учётных данных.
- [Access policy](https://github.com/pilprod/zero-trust-mesh-policy): Политика доступа по тегам к агентам, хранилищам, сервисам наблюдаемости и рабочим процессам. Пример политики, а не опубликованная конфигурация действующей сети.
- [Google Cloud network lab](https://github.com/pilprod/gcp-ngfw-network-lab): Основа лаборатории OPNsense на Terraform: LAN/WAN, маршрутизация и NAT. Только сетевая основа. Наличие образа сетевого устройства, развёртывание в облаке и выполнение apply не подразумеваются.

## Фотографии лаборатории

Фото показывают историческую установку, а не подтверждение сборки публичного кода.

- [Рабочее место для сборки электроники](https://papou.work/portfolio-images/electronics-workbench.jpg): Отладочные платы, датчики, проводка и паяльные инструменты во время прототипирования. Фон или идентифицирующие детали обработаны с помощью AI. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/electronics-workbench.jpg).
- [Схема соединений и ввода-вывода](https://papou.work/portfolio-images/wiring-diagram.jpg): Исходная схема подключения компонентов, созданная при проектировании системы. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/wiring-diagram.jpg).
- [Прототип на макетной плате](https://papou.work/portfolio-images/breadboard-prototype-1024.jpg): Модули датчиков и соединительные провода на макетной плате при разработке контроллера. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/6e428389b7df697cc4fede585ad199d1fd922211/docs/images/breadboard-prototype-1024.jpg).
- [Панель Home Assistant](https://papou.work/portfolio-images/home-assistant-dashboard.jpg): Показатели климата и воды, управление освещением и состояния устройств. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/home-assistant-dashboard.jpg).
- [Освещение и вентиляция](https://papou.work/portfolio-images/lighting-ventilation.jpg): Подвесные светильники, вентиляционное оборудование и проводка внутри установки. Фон или идентифицирующие детали обработаны с помощью AI. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/lighting-ventilation.jpg).
- [Водяной контур](https://papou.work/portfolio-images/water-system.jpg): Резервуары, дозирующие насосы, клапаны, трубки и контур циркуляции. Фон или идентифицирующие детали обработаны с помощью AI. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/water-system.jpg).
- [Камера внутри установки](https://papou.work/portfolio-images/enclosure-camera.jpg): Размещение камеры в экспериментальной установке. Фон или идентифицирующие детали обработаны с помощью AI. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/enclosure-camera.jpg).
- [Плата расширения питания](https://papou.work/portfolio-images/power-shield.jpg): Готовая плата расширения питания, подключённая к электронике установки. Фон или идентифицирующие детали обработаны с помощью AI. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/power-shield.jpg).
- [Корневая камера](https://papou.work/portfolio-images/root-chamber.jpg): Подвешенные корни и трубки внутри камеры. [Источник](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/root-chamber.jpg).

import generate_cert as generate_cert
import generate_mqtt_cfg as generate_mqtt_cfg
import generate_mqtt_client_cfg as generate_mqtt_client_cfg


def main():
    generate_cert.generate()
    generate_mqtt_cfg.generate()
    generate_mqtt_client_cfg.generate()


if __name__ == "__main__":
    main()

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  type    = string
  default = "rg-ipl-dataplatform-prod"
}

variable "location" {
  type    = string
  default = "eastus"
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# Azure Database for PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "psql-ipl-dataplatform"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "15"
  administrator_login    = "postgres"
  administrator_password = "SuperSecretPassword123!"
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "ipl_db"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Azure Container Apps Environment
resource "azurerm_container_app_environment" "env" {
  name                = "cae-ipl-dataplatform"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_container_app" "app" {
  name                         = "ipl-data-platform"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  template {
    container {
      name   = "ipl-app"
      image  = "ghcr.io/yourusername/ipl-data-platform:latest"
      cpu    = 0.5
      memory = "1.0Gi"

      env {
        name  = "DATABASE_URL"
        value = "postgresql://postgres:SuperSecretPassword123!@psql-ipl-dataplatform.postgres.database.azure.com:5432/ipl_db?sslmode=require"
      }
    }
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 4040
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}

output "container_app_fqdn" {
  value       = azurerm_container_app.app.ingress[0].fqdn
  description = "The public URL of the deployed IPL Data Platform"
}

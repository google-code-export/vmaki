# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20090619141908) do

  create_table "hosts", :force => true do |t|
    t.string   "name"
    t.string   "connection_type"
    t.string   "username"
    t.string   "password"
    t.boolean  "connect",         :default => false
    t.boolean  "connected",       :default => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "cpus"
    t.integer  "cores"
    t.integer  "total_memory"
    t.integer  "memory"
    t.integer  "mhz"
    t.string   "model"
    t.integer  "nodes"
    t.integer  "sockets"
    t.integer  "threads"
    t.boolean  "hvm_support"
    t.string   "ip_address"
  end

  create_table "isos", :force => true do |t|
    t.string   "description"
    t.string   "filename"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "size"
  end

  create_table "log", :force => true do |t|
    t.string   "user"
    t.string   "subject"
    t.text     "text"
    t.datetime "created_at"
    t.string   "log_level"
  end

  create_table "nics", :force => true do |t|
    t.string   "name"
    t.integer  "host_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "pools", :force => true do |t|
    t.string   "name"
    t.integer  "host_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "allocation"
    t.float    "available"
    t.float    "capacity"
    t.integer  "state"
    t.integer  "num_of_volumes"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "snapshots", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "status"
    t.decimal  "size"
    t.integer  "vm_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "restore"
    t.string   "display_date"
  end

  create_table "users", :force => true do |t|
    t.text     "name"
    t.text     "password"
    t.text     "role"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "vms", :force => true do |t|
    t.string   "name"
    t.integer  "memory"
    t.integer  "vcpu"
    t.string   "bootloader"
    t.string   "ostype"
    t.string   "status"
    t.string   "action"
    t.integer  "host_id"
    t.integer  "swapvolume_id"
    t.integer  "rootvolume_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "uuid"
    t.string   "boot_device"
    t.string   "vnc_url"
    t.integer  "max_memory"
    t.integer  "nic_id"
    t.integer  "iso_id"
    t.string   "cdrom",         :default => "phy"
  end

  create_table "vnc_ports", :force => true do |t|
    t.integer  "port"
    t.string   "vmname"
    t.string   "hostname"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "volumes", :force => true do |t|
    t.string   "name"
    t.float    "capacity"
    t.string   "vol_type"
    t.integer  "pool_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "target_path"
    t.boolean  "mkfs",        :default => false
    t.float    "allocation"
  end

end

#include <linux/module.h>	/* Nesesario para todos los modulos */
#include <linux/kernel.h>	/* Nesesario para informacion del kernel */

#include <linux/init.h>		/* Nesesario para macros */
#include <linux/proc_fs.h>
#include <asm/uaccess.h>
#include <linux/seq_file.h>
#include <linux/hugetlb.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Edwin Alfredo Lopez Gomez");	
MODULE_DESCRIPTION("Modulo de Ram");	
MODULE_SUPPORTED_DEVICE("testdevice");

struct sysinfo inf;

static int _escribir(struct seq_file *archivo, void *v){
	long memoria_total;
	long memoria_free;
	long memoria_share;
	long memoria_buffer;
	long memoria_swap;
	long libre;

	

	si_meminfo(&inf);
	memoria_total = inf.totalram * (unsigned long long)inf.mem_unit/ 1024;
	memoria_free = inf.freeram * (unsigned long long)inf.mem_unit/ 1024;
	memoria_share = inf.sharedram * (unsigned long long)inf.mem_unit/ 1024;
	memoria_buffer = inf.bufferram * (unsigned long long)inf.mem_unit/ 1024;
	memoria_swap = inf.totalswap * (unsigned long long)inf.mem_unit/ 1024;
	libre = memoria_free + memoria_buffer + memoria_share;

	seq_printf(archivo, "Resumen\n");
	seq_printf(archivo, "memoria total: %8li\n", memoria_total);
	seq_printf(archivo, "memoria libre: %8li\n", memoria_free);
	seq_printf(archivo, "memoria compartida: %8li\n", memoria_share);
	seq_printf(archivo, "memoria buffer: %8li\n", memoria_buffer);
	seq_printf(archivo, "memoria swap: %8li\n", memoria_swap);
	seq_printf(archivo, "libre: %8li\n", libre);
	
	return 0;
}

static int al_abrir(struct inode *inode, struct file *file){
	return single_open(file, _escribir, NULL);
}

static struct proc_ops operaciones = {
	.proc_open = al_abrir,
	.proc_read = seq_read
};

static int init_201314007(void){
	printk(KERN_INFO "201314007 \n");
	proc_create("moduloRAM", 0, NULL, &operaciones);
	return 0;
}

static void exit_201314007(void){
    remove_proc_entry("moduloRAM", NULL);
    printk(KERN_INFO "Sistemas Operativos 1 \n");
}

module_init(init_201314007);
module_exit(exit_201314007);

